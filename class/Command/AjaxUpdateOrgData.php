<?php

namespace AppSync\Command;

/**
 * Controller class for handling a request to update the portals in the database.
 *
 * @author Chris Detsch
 * @package appsync
 *
 */

class AjaxUpdateOrgData extends \AppSync\Command {

      public function getRequestVars(){
          return array('action'=>'AjaxGetUmbrellaList');
      }

      public function execute()
      {

        //   $orgs = $this->getAllOrganizations();
          //
        //   foreach ($orgs as $org) {
        //       $orgId = $org->id;
        //       $name = $org->long_name;
        //       $umbrellaId = $org->umbrella_id;
        //       if($name != null && $umbrellaId != null && $orgId != null)
        //       {
        //           $portal = new \AppSync\Portal($orgId, $name, $umbrellaId);
        //           \AppSync\PortalFactory::save($portal);
        //       }
        //   }

      }

      private function getAllOrganizations(){
          // This will need to be moved to the settings.
          $key = \AppSync\SettingFactory::getSetting('orgsync_key')->getValue();
          $base_url = \AppSync\SettingFactory::getSetting('orgsync_url')->getValue();
          $curl = curl_init();
          curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
          //Request list of all orginizations
          curl_setopt($curl, CURLOPT_URL, $base_url."orgs?key=$key");
          $all_org = curl_exec($curl);

          if($all_org){
              $all_org = json_decode($all_org);
          }else{
              $all_org = FALSE;
          }
          curl_close($curl);
          return $all_org;
      }
}
