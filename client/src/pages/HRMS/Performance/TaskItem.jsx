const TaskItem = ({ task, onChange }) => {
  return (
    <div className="border rounded p-3 flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="font-medium">{task.name}</span>

        <select
          className="border rounded px-2 py-1 text-sm"
          value={task.status}
          onChange={(e) =>
            onChange(task.id, { status: e.target.value })
          }
        >
          <option value="Pending">Pending</option>
          <option value="Done">Done</option>
        </select>
      </div>

      <textarea
        className="border rounded px-2 py-1 text-sm"
        placeholder="Remark (optional)"
        value={task.remark}
        onChange={(e) =>
          onChange(task.id, { remark: e.target.value })
        }
      />
    </div>
  );
};

export default TaskItem;
