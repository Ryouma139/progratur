import React, {useState, useRef} from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';

// prismjs の言語コンポーネントはグローバルな `Prism` 変数の存在に依存する古い実装のため、
// バンドラーが static import を並べ替える/別インスタンス化すると登録に失敗することがある。
// window.Prism を明示的に固定してから require で順番どおりに読み込むことで確実に登録させる。
if (typeof window !== 'undefined') {
  window.Prism = Prism;
}
require('prismjs/components/prism-clike');
require('prismjs/components/prism-csharp');
require('prismjs/components/prism-java');
require('prismjs/components/prism-python');

// 公開されている Judge0 CE (https://github.com/judge0/judge0) の実行APIを利用する。
// コードはこのサーバー上ではなく、Judge0 側の使い捨てサンドボックスコンテナ内で実行される。
// (Piston の公開API は 2026/2/15 よりホワイトリスト制へ移行し利用不可となったため、
//  代わりにキー不要・CORS許可済みの Judge0 CE 公開インスタンスを使用している)
const JUDGE0_BASE_URL = 'https://ce.judge0.com';

const LANGUAGES = {
  python: {
    label: 'Python',
    prismGrammar: 'python',
    judge0LanguageId: 113, // CPython 3.14.0
    template: 'print("Hello, Progratur!")\n',
  },
  java: {
    label: 'Java',
    prismGrammar: 'java',
    judge0LanguageId: 91, // OpenJDK 17.0.6
    template:
      'public class Main {\n' +
      '    public static void main(String[] args) {\n' +
      '        System.out.println("Hello, Progratur!");\n' +
      '    }\n' +
      '}\n',
  },
  csharp: {
    label: 'C#',
    prismGrammar: 'csharp',
    judge0LanguageId: 51, // Mono 6.6.0.161
    template:
      'using System;\n\n' +
      'class Program\n' +
      '{\n' +
      '    static void Main()\n' +
      '    {\n' +
      '        Console.WriteLine("Hello, Progratur!");\n' +
      '    }\n' +
      '}\n',
  },
};

// 秒 / キロバイト単位。公開インスタンスの負荷を避けるため控えめな値にしている
const CPU_TIME_LIMIT_SEC = 5;
const MEMORY_LIMIT_KB = 128000;
// 公開インスタンスへの連打を避けるための最小実行間隔
const MIN_RUN_INTERVAL_MS = 1500;
// Judge0側の応答が詰まった場合に備えたクライアント側のタイムアウト
// (CPU_TIME_LIMIT_SEC はサーバー側の実行時間制限であり、キュー待ちなどネットワーク全体の
//  所要時間は別途この値で上限を設ける)
const REQUEST_TIMEOUT_MS = 10000;
// 無限ループの print 等で標準出力が膨大になった場合に、表示側が固まらないようにする上限
const MAX_OUTPUT_CHARS = 5000;

function truncateOutput(content) {
  if (!content) return content;
  if (content.length <= MAX_OUTPUT_CHARS) return content;
  return content.slice(0, MAX_OUTPUT_CHARS) + `\n…(出力が大きすぎるため以降は省略されました。全${content.length}文字)`;
}

function OutputBlock({label, content, tone}) {
  if (!content) return null;
  const colors = {
    error: '#ff6b6b',
    muted: 'var(--ifm-color-emphasis-600)',
    default: 'var(--ifm-font-color-base)',
  };
  return (
    <div style={{marginBottom: '0.75rem'}}>
      <div
        style={{
          fontSize: '0.8rem',
          fontWeight: 700,
          marginBottom: '0.25rem',
          color: colors[tone] || colors.default,
        }}>
        {label}
      </div>
      <pre
        style={{
          margin: 0,
          padding: '0.75rem',
          borderRadius: '8px',
          background: 'var(--ifm-color-emphasis-100)',
          color: colors[tone] || colors.default,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          fontSize: '0.85rem',
        }}>
        {content}
      </pre>
    </div>
  );
}

export default function Playground() {
  const [langId, setLangId] = useState('python');
  const [codeByLang, setCodeByLang] = useState(() => {
    const initial = {};
    for (const id of Object.keys(LANGUAGES)) {
      initial[id] = LANGUAGES[id].template;
    }
    return initial;
  });
  const [stdin, setStdin] = useState('');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const lastRunRef = useRef(0);

  const lang = LANGUAGES[langId];
  const code = codeByLang[langId];

  const setCode = (value) => {
    setCodeByLang((prev) => ({...prev, [langId]: value}));
  };

  const resetCode = () => {
    setCodeByLang((prev) => ({...prev, [langId]: lang.template}));
    setResult(null);
  };

  const runCode = async () => {
    if (running) return;
    const now = Date.now();
    if (now - lastRunRef.current < MIN_RUN_INTERVAL_MS) return;
    lastRunRef.current = now;

    setRunning(true);
    setResult(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${JUDGE0_BASE_URL}/submissions?base64_encoded=false&wait=true`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          source_code: code,
          language_id: lang.judge0LanguageId,
          stdin,
          cpu_time_limit: CPU_TIME_LIMIT_SEC,
          memory_limit: MEMORY_LIMIT_KB,
        }),
        signal: controller.signal,
      });

      if (response.status === 429) {
        setResult({error: '実行リクエストが混み合っています。しばらく待ってから再実行してください。'});
        return;
      }
      if (!response.ok) {
        setResult({error: `実行サーバーがエラーを返しました (HTTP ${response.status})`});
        return;
      }
      const data = await response.json();
      setResult({data});
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setResult({error: `実行がタイムアウトしました(${REQUEST_TIMEOUT_MS / 1000}秒)。実行環境が混雑している可能性があります。しばらくしてから再実行してください。`});
      } else {
        setResult({error: `実行環境への接続に失敗しました: ${err instanceof Error ? err.message : String(err)}`});
      }
    } finally {
      clearTimeout(timeoutId);
      setRunning(false);
    }
  };

  return (
    <div style={{maxWidth: '960px', margin: '0 auto', padding: '2rem'}}>
      <p style={{opacity: 0.8, fontSize: '0.9rem'}}>
        入力したコードは、このサイトのサーバーではなく、外部の使い捨てサンドボックス実行環境
        (<a href="https://github.com/judge0/judge0" target="_blank" rel="noreferrer">Judge0</a>)
        にネットワーク経由で送信され、隔離されたコンテナ内で実行されます。機密情報や個人情報を含むコードは入力しないでください。
      </p>

      <div style={{display: 'flex', gap: '0.5rem', marginBottom: '1rem'}}>
        {Object.keys(LANGUAGES).map((id) => (
          <button
            key={id}
            onClick={() => {
              setLangId(id);
              setResult(null);
            }}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: '999px',
              border: '1px solid var(--ifm-color-emphasis-300)',
              background: id === langId ? 'var(--ifm-color-primary)' : 'transparent',
              color: id === langId ? '#fff' : 'inherit',
              cursor: 'pointer',
              fontWeight: 600,
            }}>
            {LANGUAGES[id].label}
          </button>
        ))}
      </div>

      <div
        style={{
          border: '1px solid var(--ifm-color-emphasis-300)',
          borderRadius: '8px',
          overflow: 'hidden',
          marginBottom: '0.75rem',
        }}>
        <Editor
          value={code}
          onValueChange={setCode}
          highlight={(text) => {
            const grammar = Prism.languages[lang.prismGrammar];
            return grammar ? Prism.highlight(text, grammar, lang.prismGrammar) : text;
          }}
          padding={14}
          textareaId="playground-code-editor"
          style={{
            fontFamily: '"Fira Code", "Consolas", monospace',
            fontSize: 14,
            background: '#2d2d2d',
            color: '#ccc',
            minHeight: '280px',
          }}
        />
      </div>

      <details style={{marginBottom: '1rem'}}>
        <summary style={{cursor: 'pointer', fontSize: '0.85rem', opacity: 0.8}}>
          標準入力 (stdin) を指定する
        </summary>
        <textarea
          value={stdin}
          onChange={(e) => setStdin(e.target.value)}
          rows={3}
          style={{
            width: '100%',
            marginTop: '0.5rem',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            padding: '0.5rem',
            borderRadius: '6px',
            border: '1px solid var(--ifm-color-emphasis-300)',
            background: 'var(--ifm-background-color)',
            color: 'inherit',
          }}
        />
      </details>

      <div style={{display: 'flex', gap: '0.5rem', marginBottom: '1.5rem'}}>
        <button
          onClick={runCode}
          disabled={running}
          style={{
            padding: '0.5rem 1.5rem',
            borderRadius: '6px',
            border: 'none',
            background: 'var(--ifm-color-primary)',
            color: '#fff',
            fontWeight: 700,
            cursor: running ? 'default' : 'pointer',
            opacity: running ? 0.6 : 1,
          }}>
          {running ? '実行中…' : '実行'}
        </button>
        <button
          onClick={resetCode}
          disabled={running}
          style={{
            padding: '0.5rem 1.5rem',
            borderRadius: '6px',
            border: '1px solid var(--ifm-color-emphasis-300)',
            background: 'transparent',
            color: 'inherit',
            cursor: running ? 'default' : 'pointer',
          }}>
          リセット
        </button>
      </div>

      {result?.error && <OutputBlock label="エラー" content={result.error} tone="error" />}

      {result?.data && (
        <div>
          {/* 大量出力で埋もれないよう、実行結果(エラーかどうか)を最初に表示する */}
          <OutputBlock
            label="実行結果"
            content={
              result.data.status
                ? `${result.data.status.description}` +
                  (result.data.time ? ` (実行時間: ${result.data.time}s, メモリ: ${result.data.memory ?? '-'}KB)` : '')
                : ''
            }
            tone={result.data.status && result.data.status.id !== 3 ? 'error' : 'muted'}
          />
          <OutputBlock label="コンパイル出力" content={truncateOutput(result.data.compile_output)} tone="error" />
          <OutputBlock label="標準出力 (stdout)" content={truncateOutput(result.data.stdout)} />
          <OutputBlock label="標準エラー出力 (stderr)" content={truncateOutput(result.data.stderr)} tone="error" />
          <OutputBlock label="メッセージ" content={result.data.message} tone="error" />
        </div>
      )}
    </div>
  );
}
