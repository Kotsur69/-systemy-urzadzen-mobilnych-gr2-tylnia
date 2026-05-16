import { localDb, type StoredEvent } from "./localDb";

export type SchoolEvent = StoredEvent;

export const getUpcomingEvents = () => localDb.events.getUpcoming();
export const getAllEvents = () => localDb.events.getAll();

export const addEvent = async (data: Omit<SchoolEvent, "id">): Promise<SchoolEvent> => {
  const event: SchoolEvent = { ...data, id: `ev-${Date.now()}` };
  await localDb.events.add(event);
  return event;
};

export const deleteEvent = (id: string) => localDb.events.remove(id);
