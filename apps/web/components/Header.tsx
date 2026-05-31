import Link from "next/link";
import Logo from "./Logo";

function Header() {
  return (
    <div className="w-4/5 mx-auto">
      <div className="flex items-center justify-between py-4">
        <Link href={"/"}>
          <Logo />
        </Link>
        <div className="hidden md:flex items-center gap-10 text-base">
          <Link href={"/"} className="hover:text-emerald-700 cursor-pointer">
            Home
          </Link>
          <Link href={"#"} className="hover:text-emerald-700 cursor-pointer">
            Pricing
          </Link>
          <Link
            href={"#features"}
            className="hover:text-emerald-700 cursor-pointer"
          >
            Features
          </Link>
          <Link
            href={"#features"}
            className="hover:text-emerald-700 cursor-pointer"
          >
            How it works
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Header;
