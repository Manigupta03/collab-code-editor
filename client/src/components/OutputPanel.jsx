export default function OutputPanel({ output, isRunning }) {
  const hasError = output?.stderr || output?.compile_output;

  return (
    <div className="output-panel">
      <div className="output-header">
        <span>Output</span>
        {output?.status && (
          <span className={`status-badge ${hasError ? "error" : "success"}`}>
            {output.status}
          </span>
        )}
      </div>
      <div className="output-body">
        {isRunning && <span className="running">⏳ Running…</span>}
        {!isRunning && !output && (
          <span className="placeholder">Click ▶ Run to execute your code</span>
        )}
        {!isRunning && output && (
          <>
            {output.stdout && (
              <pre className="out stdout">{output.stdout}</pre>
            )}
            {output.compile_output && (
              <pre className="out compile-err">{output.compile_output}</pre>
            )}
            {output.stderr && (
              <pre className="out stderr">{output.stderr}</pre>
            )}
          </>
        )}
      </div>
    </div>
  );
}
