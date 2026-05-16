import {
  Box,
  Card,
  CardContent,
  Typography,
} from "@mui/material";

import { useEffect, useState } from "react";

import { fetchNotifications } from "../services/api";

import { type Notification } from "../types/notification";

const priorityWeights: Record<string, number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

export default function PriorityPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    const data = await fetchNotifications();

    const sorted = data.sort((a: Notification, b: Notification) => {
      const weightA = priorityWeights[a.Type] || 0;
      const weightB = priorityWeights[b.Type] || 0;

      if (weightA !== weightB) {
        return weightB - weightA;
      }

      return (
        new Date(b.Timestamp).getTime() -
        new Date(a.Timestamp).getTime()
      );
    });

    setNotifications(sorted.slice(0, 10));
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Priority Notifications
      </Typography>

      {notifications.map((notification) => (
        <Card
          key={notification.ID}
          sx={{
            mb: 2,
            borderLeft: "6px solid red",
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
    </Box>
  );
}