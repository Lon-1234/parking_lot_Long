package com.lon.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

/**
 * <p>
 * 月租套餐表
 * </p>
 *
 * @author Long
 * @since 2026-09-13
 */
@Getter
@Setter
@TableName("monthly_plan")
public class MonthlyPlan implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 月租套餐主键
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 停车场ID
     */
    private Long parkingLotId;

    /**
     * 套餐名称
     */
    private String planName;

    /**
     * 适用车辆类型：SMALL/NEW_ENERGY
     */
    private String vehicleType;

    /**
     * 套餐月数
     */
    private Integer monthCount;

    /**
     * 套餐价格
     */
    private BigDecimal price;

    /**
     * 套餐说明
     */
    private String description;

    /**
     * 状态：0停用，1启用
     */
    private Byte status;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    private LocalDateTime updateTime;
}
