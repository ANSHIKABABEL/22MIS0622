import {
  Box,
  Card,
  CardContent,
  Typography,
  MenuItem,
  Select,
  Pagination,
} from "@mui/material";

import { useEffect, useState } from "react";

import { fetchNotifications } from "../services/api";

import { type Notification } from "../types/notification";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [page, setPage] = useState(1);
  const [type, setType] = useState("");

  useEffect(() => {
    loadNotifications();
  }, [page, type]);

  async function loadNotifications() {
    const data = await fetchNotifications(page, 10, type);

    setNotifications(data);
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        All Notifications
      </Typography>

      <Select
        value={type}
        onChange={(e) => setType(e.target.value)}
        displayEmpty
        sx={{ mb: 3, minWidth: 200 }}
      >
        <MenuItem value="">All</MenuItem>
        <MenuItem value="Placement">Placement</MenuItem>
        <MenuItem value="Result">Result</MenuItem>
        <MenuItem value="Event">Event</MenuItem>
      </Select>

      {notifications.map((notification) => (
        <Card
          key={notification.ID}
          sx={{
            mb: 2,
            borderLeft: "6px solid #1976d2",
          }}
        >
          <CardContent>
            <Typography variant="h6">
              {notification.Type}
            </Typography>

            <Typography>
              {notification.Message}
            </Typography>

            <Typography variant="body2">
              {notification.Timestamp}
            </Typography>
          </CardContent>
        </Card>
      ))}

      <Pagination
        count={10}
        page={page}
        onChange={(_, value) => setPage(value)}
      />
    </Box>
  );
}