<?php

namespace AppSync;

use \Database;

/**
 * Factory class for retrieving Settings from the database.
 *
 * @author Chris Detsch
 * @package appsync
 *
 */

class SettingFactory {

    /**
     * Retrieves the setting from the database.
     * @return SettingRestored
     */
    public static function getSetting($setting)
    {
        $db = PdoFactory::getPdoInstance();

        $query = "SELECT * FROM appsync_settings WHERE setting = :setting";

        $stmt = $db->prepare($query);

        $params = array('setting' => $setting);

        $stmt->execute($params);
        $stmt->setFetchMode(\PDO::FETCH_CLASS, 'AppSync\SettingRestored');

        return $stmt->fetch();
    }
}
