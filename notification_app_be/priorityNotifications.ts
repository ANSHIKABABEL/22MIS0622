import axios from "axios";

type Notification = {
  ID: string;
  Type: string;
  Message: string;
  Timestamp: string;
};

const AUTH_URL = "http://4.224.186.213/evaluation-service/auth";

const credentials = {
  "email": "anshika.babel2022@vitstudent.ac.in",
  "name": "anshika babel",
  "rollNo": "22mis0622",
  "accessCode": "SfFuWg",
  "clientID": "0b7f62bc-8ff5-4eae-b7cc-dd25858e8da4",
  "clientSecret": "SSFfkkYGZnKJpUDc"
};

const priorityWeights: Record<string, number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

async function getToken() {
  const response = await axios.post(AUTH_URL, credentials);

  return response.data.access_token;
}

async function fetchNotifications() {
  try {
    const token = await getToken();

    const response = await axios.get(
      "http://4.224.186.213/evaluation-service/notifications",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data.notifications;
  } catch (error) {
    console.log("Failed to fetch notifications");
    return [];
  }
}

function sortNotifications(notifications: Notification[]) {
  return notifications.sort((a, b) => {
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
}

async function main() {
  const notifications = await fetchNotifications();

  const topNotifications = sortNotifications(notifications).slice(0, 10);

  console.log("\nTop 10 Priority Notifications:\n");

  topNotifications.forEach((notification, index) => {
    console.log(`${index + 1}.`);
    console.log(`Type: ${notification.Type}`);
    console.log(`Message: ${notification.Message}`);
    console.log(`Timestamp: ${notification.Timestamp}`);
    console.log("----------------------------");
  });
}

main();