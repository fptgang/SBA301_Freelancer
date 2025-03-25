import { useGetIdentity } from "@refinedev/core";
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { AccountDto, AccountDtoRoleEnum } from "../../../generated";

type ProtectedRouteProps = {
  children: ReactNode;
  requiredRoles?: string[];
};

const ProtectedRoute = ({
  children,
  requiredRoles = [],
}: ProtectedRouteProps) => {
  const location = useLocation();
  const { data: user, isLoading } = useGetIdentity<AccountDto>();

  if (isLoading) {
    // Return loading state or skeleton while checking authentication
    return <div>Loading...</div>;
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log(user.role);    
  // If no specific roles are required, or the user's role is in the required roles, allow access
  if (requiredRoles.length === 0 || requiredRoles.includes(user.role || "")) {
    return <>{children}</>;
  }

  // If user doesn't have the required role, redirect to appropriate dashboard or home
  switch (user.role) {
    case AccountDtoRoleEnum.Admin:
      return <Navigate to="/admin/dashboard" replace />;
    case AccountDtoRoleEnum.Client:
      return <Navigate to="/client/dashboard" replace />;
    case AccountDtoRoleEnum.Staff:
      return <Navigate to="/admin/dashboard" replace />;
    case AccountDtoRoleEnum.Freelancer:
      return <Navigate to="/freelancer/dashboard" replace />;
    default:
      return <Navigate to="/" replace />;
  }
};

export default ProtectedRoute;
