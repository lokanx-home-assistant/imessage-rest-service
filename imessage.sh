#!/bin/sh
exec <"$0" || exit; read v; read v; exec /usr/bin/osascript - "$@"; exit

on run {targetBuddyPhone, targetMessage}
    tell application "Messages"
        set targetService to 1st service whose service type = iMessage
        set targetBuddy to buddy targetBuddyPhone of targetService
        send targetMessage to targetBuddy
    end tell
end run
