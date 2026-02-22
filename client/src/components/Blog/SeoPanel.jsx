export default function SeoPanel({ form, onChange }) {
  return (
    <div>
      <h3 className="font-semibold mb-2">SEO</h3>

      <input
        name="seoTitle"
        value={form.seoTitle}
        onChange={onChange}
        placeholder="SEO Title"
        className="w-full border p-2 mb-2"
      />

      <textarea
        name="seoDescription"
        value={form.seoDescription}
        onChange={onChange}
        placeholder="Meta Description"
        className="w-full border p-2"
      />
    </div>
  );
}
