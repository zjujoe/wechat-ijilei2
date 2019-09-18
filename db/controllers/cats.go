package controllers

import (
	"encoding/json"
	"errors"
	"jeedev-api3/models"
	"strconv"
	"strings"
    "fmt"
	"github.com/astaxie/beego"
)

// CatsController operations for Cats
type CatsController struct {
	beego.Controller
}

// URLMapping ...
func (c *CatsController) URLMapping() {
	c.Mapping("Post", c.Post)
	c.Mapping("GetOne", c.GetOne)
	c.Mapping("GetAll", c.GetAll)
	c.Mapping("Put", c.Put)
	c.Mapping("Delete", c.Delete)
}

// Post ...
// @Title Post
// @Description create Cats
// @Param	body		body 	models.Items	true		"body for Cats content"
// @Success 201 {int} models.Items
// @Failure 403 body is empty
// @router / [post]
func (c *CatsController) Post() {
	var v models.Items
	if err := json.Unmarshal(c.Ctx.Input.RequestBody, &v); err == nil {
		if _, err := models.AddItems(&v); err == nil {
			c.Ctx.Output.SetStatus(201)
			c.Data["json"] = v
		} else {
			c.Data["json"] = err.Error()
		}
	} else {
		c.Data["json"] = err.Error()
	}
	c.ServeJSON()
}

// GetOne ...
// @Title Get One
// @Description get Cats by id
// @Param	id		path 	string	true		"The key for staticblock"
// @Success 200 {object} models.Items
// @Failure 403 :id is empty
// @router /:id [get]
func (c *CatsController) GetOne() {
	idStr := c.Ctx.Input.Param(":id")
	id, _ := strconv.Atoi(idStr)
	v, err := models.GetItemsById(id)
	if err != nil {
		c.Data["json"] = err.Error()
	} else {
		c.Data["json"] = v
	}
	c.ServeJSON()
}

// GetAll ...
// @Title Get All
// @Description get Cats
// @Param	query	query	string	false	"Filter. e.g. col1:v1,col2:v2 ..."
// @Param	fields	query	string	false	"Fields returned. e.g. col1,col2 ..."
// @Param	sortby	query	string	false	"Sorted-by fields. e.g. col1,col2 ..."
// @Param	order	query	string	false	"Order corresponding to each sortby field, if single value, apply to all sortby fields. e.g. desc,asc ..."
// @Param	limit	query	string	false	"Limit the size of result set. Must be an integer"
// @Param	offset	query	string	false	"Start position of result set. Must be an integer"
// @Success 200 {object} models.Items
// @Failure 403
// @router / [get]
func (c *CatsController) GetAll() {
	var fields []string
	var sortby []string
	var order []string
	var query = make(map[string]string)
	var limit int = 10
	var offset int64

	var uid string

	// fields: col1,col2,entity.col3
	if v := c.GetString("fields"); v != "" {
		fields = strings.Split(v, ",")
	}
	// limit: 10 (default is 10)
	if v, err := c.GetInt("limit"); err == nil {
		limit = v
	}
	// offset: 0 (default is 0)
	if v, err := c.GetInt64("offset"); err == nil {
		offset = v
	}
	// sortby: col1,col2
	if v := c.GetString("sortby"); v != "" {
		sortby = strings.Split(v, ",")
	}
	// order: desc,asc
	if v := c.GetString("order"); v != "" {
		order = strings.Split(v, ",")
	}
	// query: k:v,k:v
	if v := c.GetString("query"); v != "" {
		for _, cond := range strings.Split(v, ",") {
			kv := strings.SplitN(cond, ":", 2)
			if len(kv) != 2 {
				c.Data["json"] = errors.New("Error: invalid query key/value pair")
				c.ServeJSON()
				return
			}
			k, v := kv[0], kv[1]
            if k == "Uid" {
	            uid = v
            } else {
                query[k] = v
            }
		}
	}

    var ml []interface{}
	var llimit int = -2
	var ulimit int = 0

    offset = 0
    for {
        if len(ml) >= limit  {
            break
        }
        l, err := models.GetAllItems(query, fields, sortby, order, offset, 1)
        offset += 1
        if err != nil {
            fmt.Println(err.Error())
            break
        }
        if len(l) == 0 {
            llimit += 2
            ulimit += 2
            if ulimit > 4 {
                break
            } else {
                offset = 0
            }
        } else {
            var v2 models.Items
            v2 = l[0].(models.Items)
            var s int
            s = GetItemRecitalStatus(uid, strconv.Itoa(v2.Id))
            if s > llimit && s <= ulimit {
                ml = append(ml, v2)
            }
        }
    }

    c.Data["json"] = ml
	c.ServeJSON()
}

func GetItemRecitalStatus(uid string, iid string)(out int)  {
	var fields []string
	var sortby []string
	var order []string
	var query = make(map[string]string)
	var limit int64 = 1
	var offset int64 = 0

    query["Uid"]=uid
    query["Iid"]=iid
	l, err := models.GetAllItemrecitals(query, fields, sortby, order, offset, limit)
	if err != nil {
        fmt.Println("GetItemRecitalStatus, 182, ", err.Error())
        return -1
	} else {
        if len(l) == 0 {
            return 0
        }
	    var v models.Itemrecitals
        v = l[0].(models.Itemrecitals)
        return v.Status
	}
}

// Put ...
// @Title Put
// @Description update the Cats
// @Param	id		path 	string	true		"The id you want to update"
// @Param	body		body 	models.Items	true		"body for Cats content"
// @Success 200 {object} models.Items
// @Failure 403 :id is not int
// @router /:id [put]
func (c *CatsController) Put() {
	idStr := c.Ctx.Input.Param(":id")
	id, _ := strconv.Atoi(idStr)
	v := models.Items{Id: id}
	if err := json.Unmarshal(c.Ctx.Input.RequestBody, &v); err == nil {
		if err := models.UpdateItemsById(&v); err == nil {
			c.Data["json"] = "OK"
		} else {
			c.Data["json"] = err.Error()
		}
	} else {
		c.Data["json"] = err.Error()
	}
	c.ServeJSON()
}

// Delete ...
// @Title Delete
// @Description delete the Cats
// @Param	id		path 	string	true		"The id you want to delete"
// @Success 200 {string} delete success!
// @Failure 403 id is empty
// @router /:id [delete]
func (c *CatsController) Delete() {
	idStr := c.Ctx.Input.Param(":id")
	id, _ := strconv.Atoi(idStr)
	if err := models.DeleteItems(id); err == nil {
		c.Data["json"] = "OK"
	} else {
		c.Data["json"] = err.Error()
	}
	c.ServeJSON()
}
