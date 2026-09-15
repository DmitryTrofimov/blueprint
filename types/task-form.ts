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
}

export const EMPTY_CREATE_TASK_FORM: CreateTaskFormValues = {
  title: "",
  description: "",
  tags: [],
  statusId: "",
  priorityId: "",
  assignedTo: "",
};
