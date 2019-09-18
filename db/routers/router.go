// @APIVersion 1.0.0
// @Title beego Test API
// @Description beego has a very cool tools to autogenerate documents for your API
// @Contact astaxie@gmail.com
// @TermsOfServiceUrl http://beego.me/
// @License Apache 2.0
// @LicenseUrl http://www.apache.org/licenses/LICENSE-2.0.html
package routers

import (
	"jeedev-api3/controllers"

	"github.com/astaxie/beego"
)

func init() {
	ns := beego.NewNamespace("/v1",

		beego.NSNamespace("/bookrecitals",
			beego.NSInclude(
				&controllers.BookrecitalsController{},
			),
		),

		beego.NSNamespace("/books",
			beego.NSInclude(
				&controllers.BooksController{},
			),
		),

		beego.NSNamespace("/favorites",
			beego.NSInclude(
				&controllers.FavoritesController{},
			),
		),

		beego.NSNamespace("/itemcomments",
			beego.NSInclude(
				&controllers.ItemcommentsController{},
			),
		),

		beego.NSNamespace("/itemrecitals",
			beego.NSInclude(
				&controllers.ItemrecitalsController{},
			),
		),

		beego.NSNamespace("/items",
			beego.NSInclude(
				&controllers.ItemsController{},
			),
		),

		beego.NSNamespace("/punches",
			beego.NSInclude(
				&controllers.PunchesController{},
			),
		),

		beego.NSNamespace("/punchsummaries",
			beego.NSInclude(
				&controllers.PunchsummariesController{},
			),
		),

		beego.NSNamespace("/superusers",
			beego.NSInclude(
				&controllers.SuperusersController{},
			),
		),

		beego.NSNamespace("/user_operate_history",
			beego.NSInclude(
				&controllers.UserOperateHistoryController{},
			),
		),

		beego.NSNamespace("/users",
			beego.NSInclude(
				&controllers.UsersController{},
			),
		),
	)
	beego.AddNamespace(ns)
}
