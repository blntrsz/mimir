import { getFormProps, getInputProps } from "@conform-to/react";
import { InfoOutlined } from "@mui/icons-material";
import {
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
} from "@mui/joy";
import { Form, useNavigation } from "react-router-dom";

import { useFindOneTaskByIdQuery } from "@mimir/frontend/api/task/find-one-task-by-id";
import {
  UPDATE_TASK_ACTION,
  useUpdateTaskForm,
} from "@mimir/frontend/api/task/update-task";

export function UpdateTaskForm() {
  const query = useFindOneTaskByIdQuery();
  const [form, fields] = useUpdateTaskForm();
  const { id, attributes } = query.data.data;
  const { state } = useNavigation();
  const isSubmitting = state === "submitting";
  const descriptionInputProps = getInputProps(fields.description, {
    type: "text",
  });
  const idInputProps = getInputProps(fields.id, {
    type: "hidden",
  });
  const actionInputProps = getInputProps(fields._action, {
    type: "hidden",
  });

  return (
    <Form method="post" {...getFormProps(form)}>
      <FormControl error={!!fields.description.errors}>
        <FormLabel>Task Description</FormLabel>
        <Input
          {...descriptionInputProps}
          key={descriptionInputProps.key}
          defaultValue={attributes.description}
          readOnly={isSubmitting}
          placeholder="Type in here…"
        />
        {fields.description.errors && (
          <FormHelperText>
            <InfoOutlined />
            {fields.description.errors}
          </FormHelperText>
        )}
      </FormControl>
      <input readOnly value={id} {...idInputProps} key={idInputProps.key} />
      <input
        readOnly
        value={UPDATE_TASK_ACTION}
        {...actionInputProps}
        key={actionInputProps.key}
      />
      <div className="mt-4 flex flex-col gap-2">
        <Button type="submit" disabled={isSubmitting} className="w-full">
          Save
        </Button>
      </div>
    </Form>
  );
}
