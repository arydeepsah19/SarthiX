import truck1 from "../../assets/navbar/truck1.png";
import truck2 from "../../assets/navbar/truck2.png";
import truck3 from "../../assets/navbar/truck3.png";
import truck4 from "../../assets/navbar/truck4.png";
import truck5 from "../../assets/navbar/truck5.png";

function hashStr(str = "") {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

const TRUCK_IMAGES = [truck1, truck2, truck3, truck4, truck5];

export default function TruckAvatar({
  seed = "",
  size = 52,
  avatarUrl = null,
  useApi = true,
  style: extraStyle = {},
}) {
  const safeSeed = String(seed || "default");
   const apiAvatar = `https://api.dicebear.com/7.x/adventurer/png?seed=${encodeURIComponent(safeSeed)}`;
  const truckSrc =
    TRUCK_IMAGES[hashStr(String(seed ?? "default")) % TRUCK_IMAGES.length];

  // ── Real profile photo ────────────────────────────────────────────────────
  // if (avatarUrl) {
  //   return (
  //     <img
  //       src={avatarUrl}
  //       alt="Driver"
  //       onError={(e) => {
  //         e.target.onerror = null;
  //         e.target.src = truckSrc;
  //       }}
  //       style={{
  //         width: size,
  //         height: size,
  //         borderRadius: "50%",
  //         objectFit: "cover",
  //         flexShrink: 0,
  //         ...extraStyle,
  //       }}
  //     />
  //   );
  // }
  const finalSrc = avatarUrl || (useApi ? apiAvatar : null) || truckSrc;

  // ── Truck image default ───────────────────────────────────────────────────
  // The PNGs have a black background — use it as the circle bg so it blends.
  // Truck faces right in the original, flip it to face left (feels more natural as avatar).
  return (
    <div
      style={{
        width: size,
        height: size,
        minWidth: size,
        borderRadius: "50%",
        overflow: "hidden",
        flexShrink: 0,
        background: "#000", // matches PNG black bg — no white flash
        position: "relative",
        ...extraStyle,
      }}
    >
      <img
        src={avatarUrl || apiAvatar}
        alt="avatar"
        onError={(e) => {
          e.target.onerror = null;

          // If Clerk image fails → go to API
          if (e.target.src == avatarUrl) {
            e.target.src = apiAvatar;
          }
          // If API fails → go to truck
          else {
            e.target.src = truckSrc;
          }
        }}
        style={{
          width: "100%",
          height: "100%",
          objectFit: avatarUrl ? "cover" : "contain",
        }}
      />
    </div>
  );
}
