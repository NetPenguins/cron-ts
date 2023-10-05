"use client"
import Image from 'next/image'
import styles from './page.module.css'
import React, { useState } from "react";
import {
  Button,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material";

export default function Home() {
  return (
    <main className={styles.main}>
      <CronJobCreator />
    </main>
  )
}



// A helper function to check if a string is a valid cron expression
const isValidCron = (str: string) => {
  // A regex pattern to match a cron expression
  const pattern = /^(\*|[0-9]+|\*\/[0-9]+)(\s+(\*|[0-9]+|\*\/[0-9]+)){4}$/;
  //onst crontabPattern = /^(\*|(?:[0-9]|[1-2][0-9]|3[0-1])(?:-(?:[0-9]|[1-2][0-9]|3[0-1]))?(?:\/[1-9][0-9]*)?(?:,(?=\d|\*)(\*|(?:[0-9]|[1-2][0-9]|3[0-1])(?:-(?:[0-9]|[1-2][0-9]|3[0-1]))?(?:\/[1-9][0-9]*)?)?)*)$/;
  /**
  ^(\\*(\\/\\d+)?|((\\d+(-\\d+)?)(,\\d+(-\\d+)?)*)|((\\d+(-\\d+)?)(,\\d+(-\\d+)?)*)\\/\\d+) (\\*(\\/\\d+)?|((\\d+(-\\d+)?)(,\\d+(-\\d+)?)*)|((\\d+(-\\d+)?)(,\\d+(-\\d+)?)*)\\/\\d+) (\\*(\\/\\d+)?|((\\d+(-\\d+)?)(,\\d+(-\\d+)?)*)|((\\d+(-\\d+)?)(,\\d+(-\\d+)?)*)\\/\\d+) (1?[0-9]|2[0-3]|(1?[0-9]|2[0-3])-(1?[0-9]|2[0-3])|(1?[0-9]|2[0-3])-(1?[0-9]|2[0-3])\\/([1-9]|1[0-9]|2[0-3])) (1?[0-9]|2[0-3]|(1?[0-9]|2[0-3])-(1?[0-9]|2[0-3])|(1?[0-9]|2[0-3])-(1?[0-9]|2[0-3])\\/([1-9]|1[0-9]|2[0-3])) .*
  */
  
  return pattern.test(str);
};

  // An array of cron names for months and week days
  const cronNames = [
    ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  ];

  // An array of cron shortcuts and their meanings
  const cronShortcuts = [
    ["@yearly", "@annually"],
    ["@monthly"],
    ["@weekly"],
    ["@daily", "@midnight"],
    ["@hourly"],
  ];

  // A map of cron fields and their ranges
  const cronFields = {
    minute: [0, 59],
    hour: [0, 23],
    day: [1, 31],
    month: [1, 12],
    week: [0, 6],
  };
  
// A helper function to generate a human-readable text from a cron expression
const getCronText = (str: string) => {
  // A function to convert a cron field value to a human-readable string
  const convertCronValue = (value: string, field: string) => {
    // If the value is *, return every
    if (value === "*") {
      return "every";
    }

    // If the value is */n, return every n
    if (value.startsWith("*/")) {
      return `every ${value.slice(2)}`;
    }

    // If the field is month or week, return the cron name
    if (field === "month" || field === "week") {
      return cronNames[field === "month" ? 0 : 1][parseInt(value) - 1];
    }

    // Otherwise, return the value as it is
    return value;
  };

  // A function to generate a human-readable string for a cron field
  const getCronFieldText = (value: string, field: string) => {
    // If the value is *, return empty string
    if (value === "*") {
      return "";
    }

    // If the value is */n, return at every n field
    if (value.startsWith("*/")) {
      return `at ${convertCronValue(value, field)} ${field}`;
    }

    // Otherwise, return on value
    return `on ${convertCronValue(value, field)}`;
  };

  // Split the cron expression by spaces
  const parts = str.split(" ");

  // Check if the cron expression is a shortcut
  for (let i = 0; i < cronShortcuts.length; i++) {
    if (cronShortcuts[i].includes(str)) {
      // Return the meaning of the shortcut
      return `Run once ${["per year", "per month", "per week", "per day", "per hour"][i]}`;
    }
  }

  // Initialize an array of text parts
  let textParts = [];

  // Loop through the cron fields and generate text for each part
  for (let i = 0; i < Object.keys(cronFields).length; i++) {
    let field = Object.keys(cronFields)[i];
    let value = parts[i];
    let text = getCronFieldText(value, field);
    if (text) {
      textParts.push(text);
    }
  }

  // Join the text parts with commas and ands
  let text =
    textParts.length > 1
      ? `${textParts.slice(0, -1).join(", ")} and ${textParts.slice(-1)}`
      : textParts[0];

  // Return the final text with Run at the beginning
  return `Run ${text}`;
};

// A helper function to generate an array of options for a cron field
const getCronOptions = (field: any) => {
  // An array of options
  let options = [];

  // Get the range of the field
  let [min, max] = cronFields[field];

  // Add the * option
  options.push("*");

  // Add the */n options
  for (let i = min + 1; i <= max; i++) {
    options.push(`*/${i}`);
  }

  // Add the numeric options
  for (let i = min; i <= max; i++) {
    options.push(i.toString());
  }

  // Return the options array
  return options;
};

function CronJobCreator() {
  const [value, setValue] = useState("* * * * *");
  const [inputValue, setInputValue] = useState(value);
  const [error, setError] = useState(false);

  const handleInputChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setInputValue(event.target.value);
  };

  const handleInputBlur = () => {
    if (isValidCron(inputValue)) {
      setValue(inputValue);
      setError(false);
    } else {
      setError(true);
    }
  };

  const handleSelectChange = (event: SelectChangeEvent<string>, index: number) => {
    let parts = value.split(" ");
    parts[index] = event.target.value;
    let newValue = parts.join(" ");
    setValue(newValue);
    setInputValue(newValue);
    setError(false);
  };

  return (
    <div style={{ margin: "20px" }}>
      <Typography variant="h4">Cron Job Scheduler</Typography>
      <div style={{ display: "flex", alignItems: "center" }}>
        <FormControl style={{ margin: "10px", width: "100px" }}>
          <InputLabel>Minute</InputLabel>
          <Select value={value.split(" ")[0]} onChange={(e) => handleSelectChange(e, 0)}>
            {getCronOptions("minute").map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl style={{ margin: "10px", width: "100px" }}>
          <InputLabel>Hour</InputLabel>
          <Select value={value.split(" ")[1]} onChange={(e) => handleSelectChange(e, 1)}>
            {getCronOptions("hour").map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl style={{ margin: "10px", width: "100px" }}>
          <InputLabel>Day</InputLabel>
          <Select value={value.split(" ")[2]} onChange={(e) => handleSelectChange(e, 2)}>
            {getCronOptions("day").map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl style={{ margin: "10px", width: "100px" }}>
          <InputLabel>Month</InputLabel>
          <Select value={value.split(" ")[3]} onChange={(e) => handleSelectChange(e, 3)}>
            {getCronOptions("month").map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl style={{ margin: "10px", width: "100px" }}>
          <InputLabel>Week</InputLabel>
          <Select value={value.split(" ")[4]} onChange={(e) => handleSelectChange(e, 4)}>
            {getCronOptions("week").map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
      <TextField
        label="Cron Expression"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        error={error}
        helperText={error ? "Invalid cron expression" : ""}
        style={{ marginTop: "10px", width: "300px" }}
      />
      <Typography variant="subtitle1" style={{ marginTop: "10px" }}>
        {getCronText(value)}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        style={{ marginTop: "10px", marginLeft: "10px" }}
      >
        Submit
      </Button>
    </div>
  );
}

