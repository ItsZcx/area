import EditUserDialog from "./EditUserDialog";
import ViewUserDialog from "./ViewUserDialog";
import { User } from "../page";
import DeleteUserDialog from "./DeleteUserDialog";

interface UserActionsProps {
    user: User;
    onUpdate: (updatedUser: User) => void;
    onDelete: (userId: number) => void;
}

const UserActions = ({ user, onUpdate, onDelete }: UserActionsProps) => {

    const handleDelete = (userId: number) => {
        onDelete(userId);
    };

    return (
        <div className='flex justify-end space-x-3'>
            <ViewUserDialog user={user} />
            <EditUserDialog user={user} onUpdate={onUpdate} />
            <DeleteUserDialog user={user} onDelete={handleDelete} />
        </div>
    );
};

export default UserActions;
