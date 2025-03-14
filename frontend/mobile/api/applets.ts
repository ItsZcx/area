// api/tasks.ts
import { API_URL } from "@/config";
import { TaskCreateRequest, TaskCreateResponse, Task} from "./types";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ! The user id (user_id) how to retrive (form the sesion in theory)
export const createTask = async (
    data: TaskCreateRequest
): Promise<{ success: boolean; message: string }> => {
    try {
        // Retrieve the access token from storage
        const accessToken = await AsyncStorage.getItem("access_token");

        if (!accessToken) {
            return {
                success: false,
                message: "User is not authenticated",
            };
        }

        // check if this is needed...
        const response = await fetch(`${API_URL}/tasks`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`, // Include the access token in the header
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            const responseData: TaskCreateResponse = await response.json();
            return { success: true, message: responseData.message };
        } else {
            const errorData = await response.json();
            return {
                success: false,
                message: errorData.detail || "Task creation failed",
            };
        }
    } catch (error) {
        console.error("Task creation error:", error);
        return {
            success: false,
            message: "Network error or server is unreachable",
        };
    }
};

// GET TAKS/APPLET by user
export const getTasks = async (userId: string, ): Promise<{ success: boolean; data?: Task[]; message?: string }> => {
    try {
      // Retrieve the access token and user_id from storage
      const accessToken = await AsyncStorage.getItem("access_token");
  
      if (!accessToken) {
        return {
          success: false,
          message: "User is not authenticated",
        };
      }
  
      if (!userId) {
        return {
          success: false,
          message: "User ID not found",
        };
      }
  
      const response = await fetch(`${API_URL}/tasks/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`, // Include the access token in the header
        },
      });
  
      if (response.ok) {
        const tasks: Task[] = await response.json();
        return { success: true, data: tasks };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.detail || "Failed to retrieve tasks",
        };
      }
    } catch (error) {
      console.error("Error retrieving tasks:", error);
      return {
        success: false,
        message: "Network error or server is unreachable",
      };
    }
  };

export async function deleteTask(taskId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Retrieve the access token from storage
      const accessToken = await AsyncStorage.getItem('access_token');
  
      if (!accessToken) {
        return {
          success: false,
          message: 'User is not authenticated',
        };
      }
  
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
  
      if (response.ok) {
        const responseData = await response.json();
        return { success: true, message: responseData.message };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.detail || 'Task deletion failed',
        };
      }
    } catch (error) {
      console.error('Task deletion error:', error);
      return {
        success: false,
        message: 'Network error or server is unreachable',
      };
    }
  }
