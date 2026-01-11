import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  Divider,
  Link as MuiLink,
} from "@mui/material";
import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import type { Course, Status } from "@/types/course";

interface CourseGraphPopupProps {
  course: Course | null;
  open: boolean;
  currentStatus: Status;
  onClose: () => void;
  onSave: (courseId: string, status: Status) => void;
}

export default function CourseGraphPopup({
  course,
  open,
  currentStatus,
  onClose,
  onSave,
}: CourseGraphPopupProps) {
  const [tempStatus, setTempStatus] = useState<Status>("Not Started");

  useEffect(() => {
    if (open) {
      setTempStatus(currentStatus === "Blocked" ? "Not Started" : currentStatus || "Not Started");
    }
  }, [open, currentStatus]);

  if (!course) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          <MuiLink
            component={Link}
            to={`/courses/${course.id}`}
            underline="hover"
            color="primary"
            onClick={onClose} // Close dialog if navigating
          >
            {course.id}
          </MuiLink>
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
          {course.title}
        </Typography>
      </DialogTitle>
      
      <DialogContent dividers>
        {/* ASSESSMENTS */}
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Assessments
        </Typography>
        {course.raw_data.assessments &&
        course.raw_data.assessments.length > 0 ? (
          <List dense>
            {course.raw_data.assessments.map((a, idx) => (
              <ListItem key={idx} disablePadding>
                <ListItemText
                  primary={a.category}
                  secondary={
                    a.flags?.is_hurdle ? (
                      <Chip
                        label="Hurdle"
                        color="error"
                        size="small"
                        sx={{ height: 20, fontSize: "0.6rem" }}
                      />
                    ) : null
                  }
                />
                <Typography variant="body2" fontWeight="bold">
                  {(a.weight * 100).toFixed(0)}%
                </Typography>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No assessments info.
          </Typography>
        )}

        <Divider sx={{ my: 2 }} />

        {/* STATUS SELECTOR */}
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Status
        </Typography>
        <RadioGroup
          value={tempStatus}
          onChange={(e) => setTempStatus(e.target.value as Status)}
        >
          <FormControlLabel
            value="Not Started"
            control={<Radio />}
            label="Not Started"
          />
          <FormControlLabel
            value="Passed"
            control={<Radio color="success" />}
            label="Passed"
          />
          <FormControlLabel
            value="Failed"
            control={<Radio color="error" />}
            label="Failed"
          />
        </RadioGroup>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={() => {
            onSave(course.id, tempStatus);
          }}
          variant="contained"
          color="primary"
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
