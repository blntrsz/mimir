import { useState } from "react";

import {
  CheckCircle,
  RadioButtonChecked,
  RadioButtonUnchecked,
} from "@mui/icons-material";
import { Option, Select } from "@mui/joy";

import { useFindOneTaskByIdQuery } from "../api/task/find-one-task-by-id";

export function UpdateTaskStateForm() {
  const query = useFindOneTaskByIdQuery();
  const { attributes } = query.data.data;
  const [value, setValue] = useState<string | null>(() => attributes.status);

  return (
    <div className="flex items-center justify-center gap-2">
      <input name="status" hidden readOnly value={value ?? attributes.status} />
      {value === "to_do" && <RadioButtonUnchecked />}
      {value === "in_progress" && <RadioButtonChecked />}
      {value === "done" && <CheckCircle />}
      <Select
        className="h-9 min-w-32"
        size="sm"
        onChange={(_event, v) => {
          setValue(v);
        }}
        defaultValue={value}
      >
        <Option value="to_do">
          <RadioButtonUnchecked />
          To Do
        </Option>
        <Option value="in_progress">
          <RadioButtonChecked />
          In Progress
        </Option>
        <Option value="done">
          <CheckCircle />
          Done
        </Option>
      </Select>
    </div>
  );
}
