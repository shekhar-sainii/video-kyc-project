import { useSelector } from "react-redux";
import { PERMISSIONS } from "../config/permissions";

const usePermission = (permission) => {
  const role = useSelector((state) => state.auth.role);

  if (!permission) return true;
  if (!role) return false;

  return PERMISSIONS[permission]?.includes(role) ?? false;
};

export default usePermission;
