import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getNotifications } from "@/lib/data/notifications";
import { NotificationRow } from "@/components/notification-row";
import { StaggerGrid, StaggerItem } from "@/components/motion/stagger-grid";

export default async function NotificationsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const notifications = await getNotifications(userId);

  // Mark everything as read for next time, but this render still uses the
  // read state fetched above so newly-arrived notifications are highlighted
  // during this visit.
  await prisma.notification.updateMany({
    where: { recipientId: userId, read: false },
    data: { read: true },
  });

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      <h1 className="font-display text-3xl font-semibold text-ink">Notifications</h1>
      <p className="mt-1 text-ink-muted">Updates from people you follow.</p>

      {notifications.length === 0 ? (
        <p className="mt-10 text-ink-muted">
          Nothing yet. New followers and playlists from people you follow will show up here.
        </p>
      ) : (
        <StaggerGrid className="mt-8 flex flex-col gap-2">
          {notifications.map((notification) => (
            <StaggerItem key={notification.id}>
              <NotificationRow notification={notification} />
            </StaggerItem>
          ))}
        </StaggerGrid>
      )}
    </div>
  );
}
