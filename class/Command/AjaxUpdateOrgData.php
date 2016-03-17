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

      /**
       * The main function for executing the command.
       * This command is currently turned off as it will probably be put into scheduled action in the future.
       */
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
          // Use the UtilityFunctions to retrieve the info to be passed to the API
          $key = \AppSync\UtilityFunctions::getOrgSyncKey();
          $base_url = \AppSync\UtilityFunctions::getOrgSyncURL();

          // Initialize curl
          $curl = curl_init();
          curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);

          //Request list of all orginizations
          curl_setopt($curl, CURLOPT_URL, $base_url."orgs?key=$key");

          // Execute the curl request and store the result
          $all_org = curl_exec($curl);

          // Check to make sure the result was valid
          if($all_org){
              $all_org = json_decode($all_org);
          }
          else
          {
              $all_org = FALSE;
          }

          // Close curl
          curl_close($curl);
          return $all_org;
      }
}
