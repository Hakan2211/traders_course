import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import UserIcon from '../icons/userIcon'
import LogoutButton from '../auth/LogoutButton'

export function AccountMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="focus:outline-none">
          <UserIcon className="w-6 h-6 hover:text-yellow-600 transition-colors duration-300 -translate-y-[0.5px]" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mx-2 w-56 text-(--text-color-primary-800) bg-(--popover-text) border-(--text-color-primary-400)">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-(--text-color-primary-400)" />
        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer">
            Support
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-(--text-color-primary-400)" />
          <DropdownMenuItem className="cursor-pointer">
            <LogoutButton />
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
