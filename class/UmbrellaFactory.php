<?php

namespace AppSync;

use \Database;

/**
 * Factory class for retrieving and saving Umbrellas to and from the database.
 *
 * @author Chris Detsch
 * @package appsync
 *
 */


class UmbrellaFactory {

    public static function getUmbrellas()
    {
        $db = PdoFactory::getPdoInstance();

        $query = 'SELECT * FROM appsync_umbrella';

        $stmt = $db->prepare($query);

        $stmt->execute();
        $stmt->setFetchMode(\PDO::FETCH_CLASS, 'AppSync\UmbrellaRestored');

        return $stmt->fetchAll();
    }

    public static function getUmbrellaByOrgId($id)
    {
        $db = PdoFactory::getPdoInstance();

        $query = 'SELECT * FROM appsync_umbrella WHERE orgsync_id = :id';

        $params = array(
            'id' => $id
        );

        $stmt = $db->prepare($query);

        $stmt->execute($params);
        $stmt->setFetchMode(\PDO::FETCH_CLASS, 'AppSync\UmbrellaRestored');

        return $stmt->fetch();
    }

    public static function save($umbrella)
    {
        $db = PdoFactory::getPdoInstance();

        $id = $umbrella->getId();

        if (isset($id)) {
            $query = "UPDATE appsync_umbrella SET (name, orgsync_id) = (:name, :orgsyncId) WHERE id = :id";

            $params = array(
                'name' => $contract->getName(),
                'orgsyncId' => $contract->getOrgSyncId(),
                'id' => $id
            );

        }else{
            // Insert
            $query = "INSERT INTO appsync_umbrella (id, name, orgsync_id) VALUES (nextval('appsync_umbrella_seq'), :name, :orgsyncId)";

            $params = array(
                'name' => $contract->getName(),
                'orgsyncId' => $contract->getOrgSyncId()
            );
        }

        $stmt = $db->prepare($query);
        $stmt->execute($params);

        // Update ID for a new object
        if (!isset($id)) {
            $umbrella->setId($db->lastInsertId('appsync_umbrella_seq'));
        }
    }
}
