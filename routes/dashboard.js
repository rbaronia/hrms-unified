const express = require('express');
const router = express.Router();
const db = require('../utils/db/connection');
const logger = require('../utils/logger');

// Helper function to format relative time
function getRelativeTimeAgo(timestamp) {
  const now = new Date();
  const date = new Date(timestamp);
  
  // Get timezone offset in milliseconds
  const tzOffset = now.getTimezoneOffset() * 60000;
  
  // Adjust dates for timezone
  const localNow = new Date(now.getTime() - tzOffset);
  const localDate = new Date(date.getTime() - tzOffset);
  
  const diffMs = localNow.getTime() - localDate.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  
  if (diffSeconds < 60) {
    return `${diffSeconds} second${diffSeconds !== 1 ? 's' : ''} ago`;
  }
  
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  }
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  }
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
}

router.get('/', async (req, res) => {
  logger.info('Received request for dashboard data');
  try {
    // Get current time and timezone offset
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000; // offset in milliseconds
    
    // Adjust time ranges for timezone
    const last24HoursTime = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    
    // Test database connection
    logger.info('Testing database connection...');
    await db.query('SELECT 1');
    logger.info('Database connection successful');

    // Get all users with their department and user type information
    logger.info('Fetching users data...');
    const [users] = await db.query(`
      SELECT 
        u.ID,
        u.USERID,
        u.FIRSTNAME,
        u.LASTNAME,
        u.MANAGER,
        u.ISMANAGER,
        u.STATUS,
        u.DATE_MODIFIED,
        d.DEPTNAME,
        t.TYPENAME,
        CONCAT(m.FIRSTNAME, ' ', m.LASTNAME) as MANAGERNAME
      FROM USER u 
      LEFT JOIN DEPARTMENT d ON u.DEPTID = d.DEPTID 
      LEFT JOIN USERTYPE t ON u.TYPEID = t.TYPEID
      LEFT JOIN USER m ON u.MANAGER = m.USERID
      ORDER BY u.DATE_MODIFIED DESC
    `);
    
    if (!users || users.length === 0) {
      logger.warn('No users found in database');
      return res.json({
        userStatusCounts: {
          total: 0,
          active: 0,
          disabled: 0,
          terminated: 0,
          recentlyUpdated: 0
        },
        departmentDistribution: [],
        userTypeDistribution: [],
        managerDistribution: [],
        recentUpdates: []
      });
    }
    
    logger.info(`Retrieved ${users.length} users from database`);

    // Calculate user status counts
    logger.info('Calculating user status counts...');
    const userStatusCounts = {
      total: users.length,
      active: users.filter(user => user.STATUS === '0').length,
      disabled: users.filter(user => user.STATUS === '1').length,
      terminated: users.filter(user => user.STATUS === '2').length,
      recentlyUpdated: users.filter(user => {
        const modifiedDate = new Date(user.DATE_MODIFIED);
        return modifiedDate >= last24HoursTime;
      }).length
    };

    // Calculate department distribution
    logger.info('Calculating department distribution...');
    const departmentData = users.reduce((acc, user) => {
      const deptName = user.DEPTNAME || 'Unassigned';
      if (!acc[deptName]) {
        acc[deptName] = { name: deptName, value: 0 };
      }
      acc[deptName].value++;
      return acc;
    }, {});

    // Calculate user type distribution
    logger.info('Calculating user type distribution...');
    const userTypeData = users.reduce((acc, user) => {
      const typeName = user.TYPENAME || 'Unassigned';
      if (!acc[typeName]) {
        acc[typeName] = { name: typeName, value: 0 };
      }
      acc[typeName].value++;
      return acc;
    }, {});

    // Get manager distribution with a separate query
    logger.info('Fetching manager distribution...');
    const [managerStats] = await db.query(`
      SELECT 
        m.USERID as manager_userid,
        m.FIRSTNAME as manager_firstname,
        m.LASTNAME as manager_lastname,
        COUNT(e.USERID) as reportee_count
      FROM USER m
      LEFT JOIN USER e ON e.MANAGER = m.USERID
      WHERE m.ISMANAGER = '1'
      GROUP BY m.USERID, m.FIRSTNAME, m.LASTNAME
      HAVING reportee_count > 0
      ORDER BY reportee_count DESC
    `);

    const reporteesData = managerStats.map(manager => ({
      name: `${manager.manager_firstname} ${manager.manager_lastname}`,
      value: manager.reportee_count,
      userid: manager.manager_userid
    }));

    // Get recent updates with relative time
    logger.info('Processing recent updates...');
    const recentUpdates = users
      .filter(user => {
        const modifiedDate = new Date(user.DATE_MODIFIED);
        return modifiedDate >= last24HoursTime;
      })
      .map(user => ({
        id: user.ID,
        userid: user.USERID,
        firstname: user.FIRSTNAME,
        lastname: user.LASTNAME,
        department: user.DEPTNAME || 'Unassigned',
        status: user.STATUS,
        date_modified: user.DATE_MODIFIED,
        time_ago: getRelativeTimeAgo(user.DATE_MODIFIED),
        manager: user.MANAGER,
        managername: user.MANAGERNAME
      }));

    // Prepare dashboard data
    const dashboardData = {
      userStatusCounts,
      departmentDistribution: Object.values(departmentData),
      userTypeDistribution: Object.values(userTypeData),
      managerDistribution: reporteesData,
      recentUpdates
    };

    logger.info('Successfully compiled dashboard data');
    res.json(dashboardData);
  } catch (error) {
    logger.error('Error fetching dashboard data:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState
    });

    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: 'Database connection failed',
        message: 'Unable to connect to the database'
      });
    }

    if (error.sqlMessage) {
      return res.status(500).json({
        error: 'Database error',
        message: process.env.NODE_ENV === 'development' ? error.sqlMessage : 'An error occurred while querying the database'
      });
    }

    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
    });
  }
});

module.exports = router;
