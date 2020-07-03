import * as React from "react";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-jsx";

const Code: React.FC<{ code: string; language: string }> = ({
  code,
  language = "javascript"
}) => {
  const prismLanguage =
    languages[language.toLowerCase()] || languages.javascript;

  return (
    <div className="rounded-lg bg-gray-800">
      <pre className="scrollbar-none m-0 p-0">
        <code
          className={`language-${language.toLowerCase()} inline-block p-4 scrolling-touch`}
          dangerouslySetInnerHTML={{
            __html: highlight(code, prismLanguage, language)
          }}
        />
      </pre>
    </div>
  );
};

export default Code;
