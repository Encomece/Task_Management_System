import React, { useContext } from "react";

//Material-ui core componets
import { Button, LinearProgress, Box } from "@material-ui/core";

//Formik Components
import { Formik, Form, Field } from "formik"; //Using Formik
import { Autocomplete } from "formik-material-ui-lab";
import * as Yup from "yup";
import { v4 as uuidv4 } from "uuid";
import { TextField } from "formik-material-ui";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import MuiTextField from "@material-ui/core/TextField";

import { TaskType } from "./TaskData/TaskType";
import { useHttpClient } from "../../../../customHooks/http-hook";
import { AuthContext } from "../../../../context/authContext";
import { TaskContext } from "../../../../context/taskContext";

//styles
import "./styles/FormContainer.css";

const FormContainer = () => {
  //custom-hook for all http work
  const { sendRequest, isLoading } = useHttpClient();

  //context
  const auth = useContext(AuthContext);
  const taskContext = useContext(TaskContext);

  //form initial-values
  const initialValues = {
    taskName: "",
    taskType: "none",
    taskDescription: "",
    dueDate: new Date(),
  };

  //Vaidation the input
  const validationSchema = Yup.object().shape({
    taskName: Yup.string().required("Add a task"),
  });

  //Submitting the form
  const onSubmit = (values, { setSubmitting }) => {
    setTimeout(async () => {
      setSubmitting(false);
      const formData = JSON.stringify(values, null, 2);
      var data = JSON.parse(formData);
      var id = uuidv4();
      var extraData = {
        userId: auth.userId,
        taskId: id,
      };
      data = { ...data, ...extraData };
      data = JSON.stringify(data);
      console.log(data);
      try {
        const response = await sendRequest(
          "http://localhost:8000/api" + "/dashboard/workspace/task",
          "POST",
          data,
          {
            "Content-Type": "application/json",
          }
        );
        console.log(response);
        if (response.ok) {
          taskContext.setAllTasksHandler(response.task);
          console.log(response.message);
        }
      } catch (error) {
        console.log(error);
      }
    }, 500);
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ submitForm, isSubmitting, touched, errors }) => (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <Form>
            <div className="formContainer">
              <Box margin={2}>
                <Field
                  component={TextField}
                  name="taskName"
                  type="text"
                  label="Task Heading"
                  style={{ width: "400px" }}
                  variant="outlined"
                />
              </Box>
              <Box margin={2}>
                <Field
                  component={Autocomplete}
                  name="taskType"
                  options={TaskType}
                  getOptionLabel={(option) => option.title || "none"}
                  style={{ width: "300px" }}
                  renderInput={(params) => (
                    <MuiTextField
                      {...params}
                      helperText={touched["taskType"] && errors["taskType"]}
                      label="Task Type"
                      variant="outlined"
                    />
                  )}
                />
              </Box>
              <Box margin={2}>
                <Field
                  component={TextField}
                  name="taskDescription"
                  type="textarea"
                  row="5"
                  fullWidth
                  label="Task Description"
                  variant="outlined"
                />
              </Box>
              <Box margin={2}>
                {isLoading && <LinearProgress />}
                <Button
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                  onClick={submitForm}
                  style={{ margin: "5px 0 0 0" }}
                >
                  Add Task
                </Button>
              </Box>
            </div>
          </Form>
        </MuiPickersUtilsProvider>
      )}
    </Formik>
  );
};

export default FormContainer;
