export interface TaskLookupOption {
  id: string;
  name: string;
}

export interface TaskAssigneeOption {
  userId: string;
  username: string;
  roleName: string;
}

export interface CreateTaskFormValues {
  title: string;
  description: string;
  tags: string[];
  statusId: string;
  priorityId: string;
  assignedTo: string;
  /** YYYY-MM-DD, today or later */
  deadline: string;
  /** 0–100, step 5; forced to 0 for ToDo */
  progress: number;
}

export const EMPTY_CREATE_TASK_FORM: CreateTaskFormValues = {
  title: "",
  description: "",
  tags: [],
  statusId: "",
  priorityId: "",
  assignedTo: "",
  deadline: "",
  progress: 0,
};
