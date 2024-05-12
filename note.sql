SELECT ms.personalized_message AS message,
       u2.name                 AS idol_name,
       u2.nickname             AS idol_nickname,
       u2.profile_image        AS profile_image,
       ms.created_at           AS created_at
FROM message_scheduled ms
         INNER JOIN idol i ON ms.idol_id = i.id
         INNER JOIN users u ON ms.users_id = u.id
         INNER JOIN users u2 ON i.user_id = u2.id
WHERE u.id = 'fcd8c164-4b9d-4e73-9360-fa388fbce2e3';

SELECT
CASE
    WHEN EXISTS (
        SELECT 1 FROM users
        WHERE (roles = 'user' OR roles = 'admin')
        AND EXTRACT(MONTH FROM birthday) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(DAY FROM birthday) = EXTRACT(DAY FROM CURRENT_DATE)
    ) THEN TRUE
    ELSE FALSE
END AS is_birthday_today;

SELECT *
FROM users
WHERE EXTRACT(MONTH FROM birthday) = EXTRACT(MONTH FROM CURRENT_DATE)
  AND EXTRACT(DAY FROM birthday) = EXTRACT(DAY FROM CURRENT_DATE);

SELECT EXISTS(
    SELECT 1
    FROM "order"
    WHERE user_id = '5de552c7-2669-484a-98e7-2504a6cfea31'
      AND order_status = 'success'
      AND o.expired_at > NOW();
);


SELECT idol_id
FROM (SELECT DISTINCT ON (i.id) i.id      AS idol_id,
                                o.user_id AS user_id
      FROM order_idol
               INNER JOIN "order" o ON order_idol.order_id = o.id
               INNER JOIN idol i ON order_idol.idol_id = i.id
      WHERE o.user_id = '5de552c7-2669-484a-98e7-2504a6cfea31'
        AND o.order_status = 'success') AS subquery
WHERE user_id = '5de552c7-2669-484a-98e7-2504a6cfea31';