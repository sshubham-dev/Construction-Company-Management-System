import { Save, Send, ArrowLeft, Printer, Ban, Loader2 } from "lucide-react";

const PurchaseFooter = ({
  mode = "create",
  status = "DRAFT",
  saving = false,
  readonly = false,

  onSave,
  onPost,
  onCancel,
  onPrint,
  onVoucherCancel,
}) => {
  return (
    <div className="sticky bottom-0 z-20 border-t bg-white shadow-lg rounded-lg">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 p-4 md:flex-row md:justify-between">
        {/* Left */}

        <button
          type="button"
          onClick={onCancel}
          className="flex items-center justify-center gap-2 rounded-lg border px-5 py-3 hover:bg-gray-50"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        {/* Right */}

        <div className="flex flex-col gap-3 md:flex-row">
          {/* View Mode */}

          {readonly && (
            <>
              <button
                type="button"
                onClick={onPrint}
                className="flex items-center justify-center gap-2 rounded-lg border px-5 py-3"
              >
                <Printer size={18} />
                Print
              </button>

              {status === "POSTED" && (
                <button
                  type="button"
                  onClick={onVoucherCancel}
                  className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-3 text-white hover:bg-red-700"
                >
                  <Ban size={18} />
                  Cancel Voucher
                </button>
              )}
            </>
          )}

          {/* Create / Edit */}

          {!readonly && (
            <>
              <button
                type="button"
                disabled={saving}
                onClick={onSave}
                className="flex items-center justify-center gap-2 rounded-lg border px-5 py-3 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}

                {mode === "edit" ? "Update Draft" : "Save Draft"}
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={onPost}
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}

                {mode === "edit" ? "Update & Post" : "Save & Post"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseFooter;
