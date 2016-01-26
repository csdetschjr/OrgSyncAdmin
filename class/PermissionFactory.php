<?php

namespace AppSync;

use \Database;

class PermissionFactory {

    public static function getPermissionsByUsername($username)
    {
        $db = PdoFactory::getPdoInstance();

        $query = 'SELECT * FROM appsync_permission WHERE username = :username';

        $params = array(
            'username' => $username
        );
        $stmt = $db->prepare($query);

        $stmt->execute($params);
        $stmt->setFetchMode(\PDO::FETCH_CLASS, 'AppSync\PermissionRestored');

        return $stmt->fetchAll();
    }

    public static function save($permission)
    {
        $db = PdoFactory::getPdoInstance();

        $id = $permission->getId();

        if (isset($id)) {
            $query = "UPDATE appsync_permission SET (name, ) = (:name, :orgsyncId) WHERE id = :id";

            $params = array(
                'id' => $id,
                'user' => $permission->getUsername(),
            );

        }else{
            // Insert
            $query = "INSERT INTO appsync_permission (id, name, ) VALUES (nextval('appsync_permission_seq'), :name, :orgsyncId)";

            $params = array(
                'name' => $contract->getName(),
            );
        }

        $stmt = $db->prepare($query);
        $stmt->execute($params);

        // Update ID for a new object
        if (!isset($id)) {
            $umbrella->setId($db->lastInsertId('appsync_permission_seq'));
        }
    }
}
