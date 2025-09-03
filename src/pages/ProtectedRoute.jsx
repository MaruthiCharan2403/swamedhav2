import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ children, requiredRole }) => {
  const token = sessionStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decodedToken = jwtDecode(token);
    if(requiredRole.includes('*')){
        return children;
    }
    const userRole = decodedToken.role;
    if (requiredRole && !requiredRole.includes(userRole)) {
      return <Navigate to="/forbidden" replace />;
    }
  } catch (error) {
    console.error("Invalid token:", error);
    return <Navigate to="/login" replace />;
  }

  return children;
};



export default ProtectedRoute;
