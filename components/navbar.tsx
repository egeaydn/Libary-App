import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Link } from "@heroui/link";
import { Input } from "@heroui/input";
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import clsx from "clsx";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { GithubIcon, SearchIcon, Logo } from "@/components/icons";

export const Navbar = () => {
  const searchInput = (
    <Input
      aria-label="Kitap ara"
      classNames={{
        inputWrapper: "bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-violet-200/50 dark:border-gray-600/50 shadow-lg",
        input: "text-sm placeholder:text-gray-500",
      }}
      labelPlacement="outside"
      placeholder="🔍 Kitap veya yazar ara..."
      startContent={
        <SearchIcon className="text-base text-violet-400 pointer-events-none flex-shrink-0" />
      }
      type="search"
    />
  );

  return (
    <HeroUINavbar 
      className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-violet-200/30 dark:border-gray-700/50 shadow-lg" 
      maxWidth="xl" 
      position="sticky"
    >
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-3 hover:scale-105 transition-transform duration-200" href="/">
            <div className="p-2 bg-gradient-to-br from-violet-500 to-blue-500 rounded-xl shadow-lg">
              <Logo className="text-white" size={24} />
            </div>
            <div className="flex flex-col">
              <p className="font-bold text-xl bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                LibraryApp
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                Kitap Koleksiyonu
              </p>
            </div>
          </NextLink>
        </NavbarBrand>
        <ul className="hidden lg:flex gap-6 justify-start ml-8">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:text-violet-600 data-[active=true]:font-medium hover:text-violet-600 transition-colors duration-200 font-medium",
                )}
                href={item.href}
              >
                {item.label}
              </NextLink>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden sm:flex gap-4 items-center">
          <Link 
            isExternal 
            aria-label="Github" 
            href={siteConfig.links.github}
            className="p-2 hover:bg-violet-100 dark:hover:bg-gray-700 rounded-xl transition-colors duration-200"
          >
            <GithubIcon className="text-gray-600 dark:text-gray-400 hover:text-violet-600 transition-colors" size={20} />
          </Link>
          <div className="p-1 hover:bg-violet-100 dark:hover:bg-gray-700 rounded-xl transition-colors duration-200">
            <ThemeSwitch />
          </div>
        </NavbarItem>
        <NavbarItem className="hidden lg:flex">{searchInput}</NavbarItem>
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <Link 
          isExternal 
          aria-label="Github" 
          href={siteConfig.links.github}
          className="p-2 hover:bg-violet-100 dark:hover:bg-gray-700 rounded-xl transition-colors duration-200"
        >
          <GithubIcon className="text-gray-600 dark:text-gray-400" size={20} />
        </Link>
        <div className="p-1 hover:bg-violet-100 dark:hover:bg-gray-700 rounded-xl transition-colors duration-200">
          <ThemeSwitch />
        </div>
        <NavbarMenuToggle className="ml-2" />
      </NavbarContent>

      <NavbarMenu className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md">
        <div className="mx-4 mt-4 mb-6">
          {searchInput}
        </div>
        <div className="mx-4 flex flex-col gap-4">
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                className="text-lg hover:text-violet-600 transition-colors duration-200 font-medium"
                color="foreground"
                href={item.href}
                size="lg"
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
