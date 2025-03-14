export type RegisterRequest = {
    email: string;
    first_name: string;
    last_name: string;
    password: string;
    phone_number: string;
    role: string;
    username: string;
};

export type RegisterResponse = {
    success: boolean;
    message: string;
};

// LOGIN

export type LoginRequest = {
    email: string;
    password: string;
};

export type LoginResponse = {
    access_token: string;
    token_type: string;
};

// APPLET / TASK
export type TaskCreateRequest =  {
    action_name: string;
    params: {
        [key: string]: any; // Adjust the type based on your specific params structure
    };
    trigger: string;
    trigger_args: string[];
    user_id: number;
}

export type TaskCreateResponse =  {
    message: string;
}

// types.ts

export type Task = {
    id: number;
    trigger: string;
    trigger_args: string[] | null;
    event_hash: string;
    action_name: string;
    user_id: number;
    requires_oauth: boolean;
    oauth_token: string | null;
    service: string;
  }
  