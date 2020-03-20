import copy from "copy-to-clipboard";
import { Toast } from "antd-mobile";

export const copyToClickBoard = (res, type) => {
  if(copy(res)) {
    Toast.success(`${type}已复制到粘贴板`);
  } else {
    Toast.fail("复制失败");
  }  
}