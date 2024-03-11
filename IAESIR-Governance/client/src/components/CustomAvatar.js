// import avatarLogo from "../images/logo-black.png";
// import avatarBlue from "../images/logo-blue.png";
// import avatarWhite from "../images/logo-white.png";
import avatarEmblem from "../images/THR-Emblem.png";

export const CustomAvatar = ({ ensImage, size }) => {
  // const color = "black";
  return ensImage ? (
    <img src={ensImage} width={size} height={size} style={{ borderRadius: 999 }} alt="" />
  ) : (
    // <div
    //   style={{
    //     backgroundColor: color,
    //     borderRadius: 999,
    //     height: size,
    //     width: size,
    //   }}
    // >
    <img src={avatarEmblem} alt="IAESIR Avatar" style={{ height: size, width: size }} />
    // </div>
  );
};
