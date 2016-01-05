<?php

namespace AppSync;

use \Database;

class SettingFactory {

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
