import api from "@/api/axios";

export const logActivity = async (
  userId,
  type,
  title,
  description,
  metadata = {}
) => {
  try {
    await api.post("/activities", {
      userId,
      type,
      title,
      description,
      metadata,
    });
  } catch (error) {
    console.error("Error logging activity:", error);
  }
};
