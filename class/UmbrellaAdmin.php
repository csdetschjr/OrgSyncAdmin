<?php

namespace AppSync;

/**
 * Object class for the UmbrellaAdmin
 *
 * @author Chris Detsch
 * @package appsync
 *
 */

class UmbrellaAdmin {
    protected $id;
    protected $username;
    protected $umbrella_id;

    public function __construct($id, $username, $umbrella_id)
    {
        $this->id = $id;
        $this->username = $username;
        $this->umbrella_id = $umbrella_id;
    }

    public function getId()
    {
        return $this->id;
    }

    public function setId($id)
    {
        $this->id = $id;
    }

    public function getUsername()
    {
        return $this->username;
    }

    public function setName($username)
    {
        $this->username = $username;
    }

    public function getUmbrellaId()
    {
        return $this->umbrella_id;
    }

    public function setUmbrellaId($umbrellaId)
    {
        $this->umbrella_id = $umbrellaId;
    }

}
