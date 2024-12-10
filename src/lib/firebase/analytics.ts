export const logUserActivity = {
  viewEvent: (eventId: string, eventTitle: string) => {
    console.log('View event:', { eventId, eventTitle, timestamp: new Date().toISOString() });
  },
  shareEvent: (eventId: string, shareMethod: string) => {
    console.log('Share event:', { eventId, shareMethod, timestamp: new Date().toISOString() });
  },
  pageView: (pageName: string) => {
    console.log('Page view:', { pageName, timestamp: new Date().toISOString() });
  },
  memberRegister: (userId: string, userData: { name: string | null; email: string | null; }) => {
    console.log('Member register:', { userId, userData, timestamp: new Date().toISOString() });
  },
  memberLogin: (userId: string, method: string) => {
    console.log('Member login:', { userId, method, timestamp: new Date().toISOString() });
  },
  memberUpdate: (userId: string, updatedFields: string[]) => {
    console.log('Member update:', { userId, updatedFields, timestamp: new Date().toISOString() });
  },
  userInteraction: (action: string, data: any, userId: string) => {
    console.log('User interaction:', { action, data, userId, timestamp: new Date().toISOString() });
  }
};