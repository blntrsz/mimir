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

import {
  CREATE_TASK_ACTION,
  useCreateTaskForm,
} from "@mimir/frontend/api/task/create-task";

export function CreateTaskForm() {
  const navigation = useNavigation();
  const [form, fields] = useCreateTaskForm();
  const descriptionInputProps = getInputProps(fields.description, {
    type: "text",
  });
  const actionInputProps = getInputProps(fields._action, {
    type: "hidden",
  });
  const isSubmitting = navigation.state === "submitting";

  return (
    <Form className="flex flex-col gap-4" method="POST" {...getFormProps(form)}>
      <FormControl error={!!fields.description.errors}>
        <FormLabel>Task Description</FormLabel>
        <Input
          {...descriptionInputProps}
          key={descriptionInputProps.key}
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

      <input
        readOnly
        value={CREATE_TASK_ACTION}
        {...actionInputProps}
        key={actionInputProps.key}
      />
      <Button disabled={isSubmitting} type="submit">
        Create
      </Button>
    </Form>
  );
}
