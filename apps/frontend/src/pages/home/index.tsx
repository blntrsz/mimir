import { useFindAllTaskPaginatedQuery } from "@mimir/frontend/api/task/find-all-task-paginated";

export function Home() {
  const tasks = useFindAllTaskPaginatedQuery();
  return (
    <div className="bg-red-200">
      <ul>
        {tasks.data.map((task) => (
          <li key={task.id}>{task.attributes.description}</li>
        ))}
      </ul>
    </div>
  );
}
