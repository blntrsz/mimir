import { getFormProps, getInputProps } from "@conform-to/react";
import { Button } from "@mui/joy";
import { Form, useNavigation, useParams } from "react-router-dom";

import { DELETE_TASK_ACTION, useDeleteTaskForm } from "../api/task/delete-task";

export function DeleteTaskForm() {
  const { state } = useNavigation();
  const isSubmitting = state === "submitting";
  const params = useParams();

  const [form, fields] = useDeleteTaskForm();
  const idInputProps = getInputProps(fields.id, {
    type: "hidden",
  });
  const actionInputProps = getInputProps(fields._action, {
    type: "hidden",
  });

  return (
    <Form method="post" {...getFormProps(form)}>
      <input
        readOnly
        value={params.id}
        {...idInputProps}
        key={idInputProps.key}
      />
      <input
        readOnly
        value={DELETE_TASK_ACTION}
        {...actionInputProps}
        key={actionInputProps.key}
      />
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
        color="danger"
      >
        Delete
      </Button>
    </Form>
  );
}
