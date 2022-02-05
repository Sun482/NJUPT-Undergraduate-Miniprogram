import Context from "./context";
import { useContext } from "rax";

export default () => {
  const userName = useContext(Context);
  return <view>{userName}</view>;
};
