import { uploadImage } from "../../api/blogApi";
import React, { useMemo, useRef } from "react";
import JoditEditor from "jodit-react";


export default function BlogEditor({ value, onChange }) {

  const editor = useRef(null);

  const config = useMemo(() => ({
    readonly: false,

    height: 600,

    toolbarSticky: true,
    toolbarStickyOffset: 60,

    placeholder: "Start writing your construction blog...",

    askBeforePasteHTML: false,
    askBeforePasteFromWord: false,

    style: {
      fontFamily: "Inter, sans-serif",
      fontSize: "16px",
      lineHeight: "1.8",
    },

    uploader: {
      insertImageAsBase64URI: false,

      async process(file) {
        const fd = new FormData();
        fd.append("image", file);

        const res = await uploadImage(fd);

        return {
          files: [res.data.url],
          path: "",
          baseurl: "",
        };
      },
    },

    buttons: [
      "paragraph",
      "|",
      "bold",
      "italic",
      "underline",
      "strikethrough",
      "|",
      "ul",
      "ol",
      "|",
      "outdent",
      "indent",
      "|",
      "image",
      "video",
      "link",
      "table",
      "|",
      "align",
      "|",
      "undo",
      "redo",
      "|",
      "hr",
      "eraser",
      "copyformat",
      "|",
      "fullsize",
    ],

  }), []);

  return (
    <div>
      <div className="max-w-4xl mx-auto bg-white border rounded-2xl shadow-sm overflow-hidden">
        <JoditEditor
          ref={editor}
          value={value || ""}
          config={config}
          onBlur={(newContent) => onChange(newContent)}
        />
      </div>

    </div>
  );
}


