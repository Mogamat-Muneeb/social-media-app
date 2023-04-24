import { CreateForm } from "./create-form";
import ProtectedRoute from '../../components/ProtectedRoute'
export const CreatePost = () => {
  return (
    <div className="create-post">
      <ProtectedRoute>
      <CreateForm />
      </ProtectedRoute>
    </div>
  );
};
