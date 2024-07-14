import { useEffect } from "react";

import {
  CheckBox,
  CheckBoxOutlineBlank,
  KeyboardArrowRight,
} from "@mui/icons-material";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemContent,
  ListItemDecorator,
} from "@mui/joy";
import { Link } from "react-router-dom";

import { TaskResponseSchema } from "@mimir/backend/core/task/app/task-response.schema";

import { useFindAllTaskPaginatedQuery } from "@mimir/frontend/api/task/find-all-task-paginated";

type Task = TaskResponseSchema["data"];

export function TaskList() {
  const query = useFindAllTaskPaginatedQuery();
  const data: Task[] =
    query.data?.pages.reduce((acc, p) => {
      return [...acc, ...p.data];
    }, [] as Task[]) ?? ([] as Task[]);

  useEffect(() => {
    if (!query.hasNextPage) return;

    query.fetchNextPage();
  }, [query.data]);

  return (
    <List>
      {data.map((d) => (
        <Link to={`/${d.id}`} key={d.id}>
          <ListItem>
            <ListItemButton disabled={!!d.attributes.done_at}>
              <ListItemDecorator>
                {d.attributes.done_at ? <CheckBox /> : <CheckBoxOutlineBlank />}
              </ListItemDecorator>
              <ListItemContent>{d.attributes.description}</ListItemContent>
              <KeyboardArrowRight />
            </ListItemButton>
          </ListItem>
        </Link>
      ))}
    </List>
  );
}
