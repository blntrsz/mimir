import { useParams } from "react-router-dom";

export function Component() {
  const params = useParams();
  return <>{params.task_id}</>;
}
